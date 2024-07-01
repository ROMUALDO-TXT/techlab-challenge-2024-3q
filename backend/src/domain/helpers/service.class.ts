export class ServiceBaseClass {
    public getFunctionName(): string {
        try {
            throw new Error();
        } catch (e) {
            const stackLines = e.stack.split('\n');
            const callerLine = stackLines[2].trim();
            const functionNameMatch = callerLine.match(/at\s+(.*)\s+\(/);
            if (functionNameMatch && functionNameMatch.length >= 2) {
                return functionNameMatch[1];
            } else {
                return '';
            }
        }
    }

    public extractServiceName() {
        try {
            throw new Error();
        } catch (e) {
            const serviceNamePattern = /(?:at\s+)(\w+Service)\./;
            const matches = e.stack.match(serviceNamePattern);
            return matches ? matches[1] : 'Service name not found';
        }
    }
}
