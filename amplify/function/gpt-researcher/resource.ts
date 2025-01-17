import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction, } from "aws-cdk-lib/aws-lambda";

export const gptResearcherLambda = defineFunction((scope) => new DockerImageFunction(scope, 'gpt-researcher-lambda', {
    code: DockerImageCode.fromImageAsset("amplify/function/gpt-researcher"),
    timeout: Duration.seconds(900),
    memorySize: 1024,
    environment: {
        "TAVILY_API_KEY": process.env.TAVILY_API_KEY || "",
        "FAST_LLM": "litellm:bedrock/converse/amazon.nova-micro-v1:0",
        "SMART_LLM": "litellm:bedrock/converse/amazon.nova-lite-v1:0",
        "STRATEGIC_LLM": "litellm:bedrock/converse/amazon.nova-pro-v1:0",
        "EMBEDDING": "bedrock:amazon.titan-embed-text-v2:0",
        "SCRAPER": "web_base_loader",
        "RESEARCH_ARN": process.env.RESEARCH_ARN || "",
        "GENERATE_ARN": process.env.GENERATE_ARN || "",
    }
}))
