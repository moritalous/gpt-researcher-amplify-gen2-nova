import boto3
from asyncio import get_event_loop

async def get_report(query: str, report_type: str):
    """
    クエリとレポートタイプに基づいてレポートを生成します。

    Args:
        query (str): ユーザーが入力したクエリ。
        report_type (str): レポートの種類。

    Returns:
        Tuple: レポート、研究コンテキスト、コスト、画像、ソース情報を含むタプル。
    """

    # GPTResearcherを初期化
    from gpt_researcher import GPTResearcher
    researcher = GPTResearcher(query, report_type)

    # researchを実行
    research_result = await researcher.conduct_research()

    # 追加情報を取得
    research_context = researcher.get_research_context()
    research_costs = researcher.get_costs()
    research_images = researcher.get_research_images()
    research_sources = researcher.get_research_sources()

    return None, research_context, research_costs, research_images, research_sources

async def run(query: str):

    report_type = "research_report"

    report, context, costs, images, sources = await get_report(query, report_type)

    # レポート生成のプロンプトを取得
    from gpt_researcher.prompts import get_prompt_by_report_type
    generate_prompt = get_prompt_by_report_type(report_type)

    # プロンプトを作成
    content = generate_prompt(
        query,
        context,
        sources,
        report_format="APA",
        tone=None,
        total_words=1000,
        language="Japanese",
    )

    # レポートを出力
    client = boto3.client("bedrock-runtime")
    response = client.converse(
        # modelId="us.amazon.nova-pro-v1:0",
        modelId="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        messages=[{"role": "user", "content": [{"text": content}]}],
    )

    return response["output"]["message"]["content"][0]["text"]


def handler(event, context):
    query = event["query"]
    return get_event_loop().run_until_complete(run(query))
