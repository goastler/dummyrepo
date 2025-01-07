function transformJson(input) {
    // JSON-encode the input
    let jsonString = JSON.stringify(input, null, 2);

    // Parse the input to work with each entry
    let parsedObject = JSON.parse(jsonString);

    // Function to handle the transformation recursively
    function processObject(obj, indent = 0) {
        if (typeof obj === 'object' && obj !== null) {
            let indentStr = ' '.repeat(indent);
            let nextIndentStr = ' '.repeat(indent + 2);

            // If the object is an array, process each element
            if (Array.isArray(obj)) {
                let processedArray = obj.map(value => processObject(value, indent + 2));
                return `[
${processedArray.map(item => nextIndentStr + item).join(`,
`)}
${indentStr}]`;
            }

            // Otherwise, it's an object, so process each key-value pair
            let transformedEntries = Object.entries(obj).map(([key, value]) => {
                // Check if the value is a primitive type (string, number, boolean, null)
                let transformedValue = processObject(value, indent + 2);
                return `${nextIndentStr}${key}: ${transformedValue}`;
            });

            return `{
${transformedEntries.join(',
')}
${indentStr}}`;
        } else {
            // Return primitives as-is
            return JSON.stringify(obj);
        }
    }

    // Apply the transformation
    let transformedJson = processObject(parsedObject);

    // Return the modified JSON string
    return transformedJson;
}

// Example Usage
const exampleInput = {
    name: "John",
    age: 30,
    isAdmin: true,
    address: {
        city: "New York",
        zip: 10001
    },
    tags: ["developer", "javascript"],
    nullValue: null
};

console.log(transformJson(exampleInput));
