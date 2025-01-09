import { defineBackend } from '@aws-amplify/backend';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { gptResearcherLambda } from './function/gpt-researcher/resource';

const backend = defineBackend({
    auth,
    gptResearcherLambda
});

const unauthenticatedUserIamRole = backend.auth.resources.unauthenticatedUserIamRole;
backend.gptResearcherLambda.resources.lambda.grantInvoke(unauthenticatedUserIamRole)


backend.gptResearcherLambda.resources.lambda.addToRolePolicy(new PolicyStatement({
    sid: "BedrockInvokePolicy",
    effect: Effect.ALLOW,
    actions: ["bedrock:*"],
    resources: ["*"]
}))

backend.addOutput({
    custom: {
        gptResearcherFunctionName: backend.gptResearcherLambda.resources.lambda.functionName,
    },
});
