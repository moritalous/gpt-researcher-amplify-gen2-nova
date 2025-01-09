import { Alert, Loader } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useState } from 'react';
import Markdown from 'react-markdown';
import outputs from '../amplify_outputs.json';
import './App.css';

Amplify.configure(outputs)

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [progress, setProgress] = useState(false)
  const [error, setError] = useState(<></>)

  async function handleSend() {
    if (input.trim()) {

      setError(<></>)
      setProgress(true)

      try {
        const { credentials } = await fetchAuthSession();
        const awsRegion = outputs.auth.aws_region;
        const functionName = outputs.custom.gptResearcherFunctionName;
        const labmda = new LambdaClient({ credentials: credentials, region: awsRegion })
        const command = new InvokeCommand({
          FunctionName: functionName,
          Payload: JSON.stringify({
            query: input
          })
        });
        const apiResponse = await labmda.send(command);

        if (apiResponse.Payload) {
          const payload = JSON.parse(new TextDecoder().decode(apiResponse.Payload))
          setOutput(payload)
        }
      } catch (e) {
        console.error(e)
        setError(<div className='items-left block text-start'>
          <Alert
            variation="error"
            isDismissible={false}
            hasIcon={true}
            heading="Error"
          >
            e
          </Alert>
        </div>)
      }

      setProgress(false)

    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className='text-2xl	font-bold'>GPT Researcher powerd by Amazon Nova</h1>
      <div className="flex items-center p-4 bg-white">

        <input
          type="text"
          className="flex-grow px-4 py-2 mr-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={handleSend}
        >
          送信
        </button>
      </div>
      <div hidden={!progress}>
        <Loader variation="linear" />
      </div>

      {error}

      <Markdown className='markdown items-left block text-start'>{output}</Markdown>
      
    </div>
  )
}

export default App
