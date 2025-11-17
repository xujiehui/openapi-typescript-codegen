import type { Operation } from '../../../client/interfaces/Operation';
import type { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getOperationErrors } from './getOperationErrors';
import { getOperationName } from './getOperationName';
import { getOperationParameterName } from './getOperationParameterName';
import { getOperationParameters } from './getOperationParameters';
import { getOperationRequestBody } from './getOperationRequestBody';
import { getOperationResponseHeader } from './getOperationResponseHeader';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResults } from './getOperationResults';
import { getRef } from './getRef';
import { getServiceName } from './getServiceName';
import { sortByRequired } from './sortByRequired';

export const getOperation = (
    openApi: OpenApi,
    url: string,
    method: string,
    tag: string,
    op: OpenApiOperation,
    pathParams: OperationParameters
): Operation => {
    const serviceName = getServiceName(tag);
    const operationName = getOperationName(url, method, op.operationId);

    // Create a new operation object for this method.
    const operation: Operation = {
        service: serviceName,
        name: operationName,
        summary: op.summary || null,
        description: op.description || null,
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: url,
        parameters: [...pathParams.parameters],
        parametersPath: [...pathParams.parametersPath],
        parametersQuery: [...pathParams.parametersQuery],
        parametersForm: [...pathParams.parametersForm],
        parametersHeader: [...pathParams.parametersHeader],
        parametersCookie: [...pathParams.parametersCookie],
        parametersBody: pathParams.parametersBody,
        parametersBodyExpanded: [...pathParams.parametersBodyExpanded],
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }

    if (op.requestBody) {
        const requestBodyDef = getRef<OpenApiRequestBody>(openApi, op.requestBody);
        const requestBody = getOperationRequestBody(openApi, requestBodyDef);
        
        // Check if requestBody has a schema reference that should be expanded
        if (requestBodyDef.content) {
            const content = getContent(openApi, requestBodyDef.content);
            if (content && content.schema.$ref && requestBody.mediaType === 'application/json') {
                // Expand schema properties into individual parameters
                const resolvedSchema = getRef<OpenApiSchema>(openApi, content.schema);
                const model = getModel(openApi, resolvedSchema);
                
                if (model.properties && model.properties.length > 0) {
                    // Expand properties as body parameters
                    const expandedParameters: OperationParameter[] = [];
                    model.properties.forEach(property => {
                        const expandedParameter: OperationParameter = {
                            in: 'body',
                            prop: property.name,
                            export: property.export,
                            name: getOperationParameterName(property.name),
                            type: property.type,
                            base: property.base,
                            template: property.template,
                            link: property.link,
                            description: property.description,
                            deprecated: property.deprecated,
                            isDefinition: false,
                            isReadOnly: property.isReadOnly,
                            isRequired: property.isRequired,
                            isNullable: property.isNullable,
                            format: property.format,
                            maximum: property.maximum,
                            exclusiveMaximum: property.exclusiveMaximum,
                            minimum: property.minimum,
                            exclusiveMinimum: property.exclusiveMinimum,
                            multipleOf: property.multipleOf,
                            maxLength: property.maxLength,
                            minLength: property.minLength,
                            maxItems: property.maxItems,
                            minItems: property.minItems,
                            uniqueItems: property.uniqueItems,
                            maxProperties: property.maxProperties,
                            minProperties: property.minProperties,
                            pattern: property.pattern,
                            default: property.default,
                            imports: property.imports,
                            enum: property.enum,
                            enums: property.enums,
                            properties: property.properties,
                            mediaType: requestBody.mediaType,
                        };
                        expandedParameters.push(expandedParameter);
                        operation.parameters.push(expandedParameter);
                        operation.imports.push(...expandedParameter.imports);
                    });
                    // Store expanded parameters and set parametersBody to null
                    operation.parametersBodyExpanded = expandedParameters;
                    operation.parametersBody = null;
                } else {
                    // No properties to expand, use original requestBody
                    operation.parameters.push(requestBody);
                    operation.parametersBody = requestBody;
                }
            } else {
                // Not a schema reference or not JSON, use original requestBody
                operation.parameters.push(requestBody);
                operation.parametersBody = requestBody;
            }
        } else {
            // No content, use original requestBody
            operation.parameters.push(requestBody);
            operation.parametersBody = requestBody;
        }
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);

        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }

    operation.parameters = operation.parameters.sort(sortByRequired);

    return operation;
};
