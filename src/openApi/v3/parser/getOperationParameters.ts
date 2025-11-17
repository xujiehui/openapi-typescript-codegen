import type { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';
import { getOperationParameter } from './getOperationParameter';
import { getOperationParameterName } from './getOperationParameterName';
import { getRef } from './getRef';

/**
 * Expand schema properties into individual operation parameters
 */
const expandSchemaProperties = (
    openApi: OpenApi,
    schema: OpenApiSchema,
    parameterIn: 'query' | 'formData' | 'header' | 'cookie'
): OperationParameter[] => {
    const expandedParameters: OperationParameter[] = [];
    
    // Get the resolved schema if it's a reference
    let resolvedSchema = schema;
    if (schema.$ref) {
        resolvedSchema = getRef<OpenApiSchema>(openApi, schema);
    }
    
    // Get the model to access properties
    const model = getModel(openApi, resolvedSchema);
    
    // If the model has properties, expand them
    if (model.properties && model.properties.length > 0) {
        model.properties.forEach(property => {
            const expandedParameter: OperationParameter = {
                in: parameterIn,
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
                mediaType: null,
            };
            expandedParameters.push(expandedParameter);
        });
    }
    
    return expandedParameters;
};

export const getOperationParameters = (openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters => {
    const operationParameters: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null, // Not used in V3 -> @see requestBody
        parametersBodyExpanded: [],
    };

    // Track parameter names to avoid duplicates
    const parameterNames = new Set<string>();

    // Helper function to add parameter if not duplicate
    const addParameterIfNotDuplicate = (
        param: OperationParameter,
        targetArray: OperationParameter[]
    ): boolean => {
        if (parameterNames.has(param.name)) {
            return false; // Skip duplicate
        }
        parameterNames.add(param.name);
        targetArray.push(param);
        operationParameters.parameters.push(param);
        operationParameters.imports.push(...param.imports);
        return true;
    };

    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameterDef = getRef<OpenApiParameter>(openApi, parameterOrReference);
        const parameter = getOperationParameter(openApi, parameterDef);

        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (parameter.prop !== 'api-version') {
            switch (parameterDef.in) {
                case 'path':
                    if (addParameterIfNotDuplicate(parameter, operationParameters.parametersPath)) {
                        // Parameter added successfully
                    }
                    break;

                case 'query':
                    // Check if this is a query parameter with a schema reference that should be expanded
                    if (parameterDef.schema?.$ref) {
                        const expandedParams = expandSchemaProperties(openApi, parameterDef.schema, 'query');
                        expandedParams.forEach(expandedParam => {
                            addParameterIfNotDuplicate(expandedParam, operationParameters.parametersQuery);
                        });
                    } else {
                        addParameterIfNotDuplicate(parameter, operationParameters.parametersQuery);
                    }
                    break;

                case 'formData':
                    // Check if this is a formData parameter with a schema reference that should be expanded
                    if (parameterDef.schema?.$ref) {
                        const expandedParams = expandSchemaProperties(openApi, parameterDef.schema, 'formData');
                        expandedParams.forEach(expandedParam => {
                            addParameterIfNotDuplicate(expandedParam, operationParameters.parametersForm);
                        });
                    } else {
                        addParameterIfNotDuplicate(parameter, operationParameters.parametersForm);
                    }
                    break;

                case 'cookie':
                    addParameterIfNotDuplicate(parameter, operationParameters.parametersCookie);
                    break;

                case 'header':
                    addParameterIfNotDuplicate(parameter, operationParameters.parametersHeader);
                    break;
            }
        }
    });
    return operationParameters;
};
