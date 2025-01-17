import { defineBackend } from '@aws-amplify/backend';
import * as genai from "@cdklabs/generative-ai-cdk-constructs";
import { CfnApplicationInferenceProfile } from "aws-cdk-lib/aws-bedrock";
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

const bedrockResourceStack = backend.createStack('bedrockResources');

/**
 * Bedrock クロスリージョン推論プロファイル
 */
const novaList = genai.bedrock.CrossRegionInferenceProfile.fromConfig({
    geoRegion: genai.bedrock.CrossRegionInferenceProfileRegion.US,
    model: genai.bedrock.BedrockFoundationModel.AMAZON_NOVA_LITE_V1,
});
const claude35SonnetV2 = genai.bedrock.CrossRegionInferenceProfile.fromConfig({
    geoRegion: genai.bedrock.CrossRegionInferenceProfileRegion.US,
    model: genai.bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
});

/**
 * Bedrock アプリケーション推論プロファイル
 */
const researchModel = new CfnApplicationInferenceProfile(
    bedrockResourceStack,
    "research_model",
    {
        inferenceProfileName: "research_model",
        modelSource: {
            copyFrom: novaList.invokableArn,
        },
    }
);
const generateModel = new CfnApplicationInferenceProfile(
    bedrockResourceStack,
    "generate_model",
    {
        inferenceProfileName: "generate_model",
        modelSource: {
            copyFrom: claude35SonnetV2.invokableArn,
        },
    }
);

backend.addOutput({
    custom: {
        gptResearcherFunctionName: backend.gptResearcherLambda.resources.lambda.functionName,
        researchModelArn: researchModel.attrInferenceProfileArn,
        generateModelArn: generateModel.attrInferenceProfileArn
    },
});
