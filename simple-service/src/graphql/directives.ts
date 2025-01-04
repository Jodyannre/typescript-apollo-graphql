import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { defaultFieldResolver, GraphQLResolveInfo } from 'graphql'

/*
    Directivas built-in

@deprecated(reason:String)
@skip(if:Boolean)
@include(if:Boolean)

*/

export function countryCodeDirectiveTransformer(schema, directiveName) {

    return mapSchema(schema, {

        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {

            const countryCodeDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

            if (countryCodeDirective) {
                const { resolve = defaultFieldResolver } = fieldConfig;

                fieldConfig.resolve = async function (source, args, context, info: GraphQLResolveInfo) {
                    const result = await resolve(source, args, context, info);

                    if (typeof result === 'string') {
                      return "+502 " + result;
                    }
                    return result;
                  }
                  return fieldConfig;
            }
        }
    })

}

export function upperCaseDirectiveTransformer(schema, directiveName) {
    return mapSchema(schema, {
  
      // Executes once for each object field in the schema
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
  
        // Check whether this field has the specified directive
        const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
  
        if (upperDirective) {
  
          // Get this field's original resolver
          const { resolve = defaultFieldResolver } = fieldConfig;
  
          // Replace the original resolver with a function that *first* calls
          // the original resolver, then converts its result to upper case
          fieldConfig.resolve = async function (source, args, context, info) {
            const result = await resolve(source, args, context, info);
            if (typeof result === 'string') {
              return result.toUpperCase();
            }
            return result;
          }
          return fieldConfig;
        }
      }
    });
  }