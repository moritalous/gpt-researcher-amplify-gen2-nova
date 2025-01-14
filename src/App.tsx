import { Alert, Placeholder } from '@aws-amplify/ui-react';
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
          if (typeof payload === 'object') {
            throw new Error(JSON.stringify(payload))
          }
          setOutput(payload)
        }
      } catch (e) {
        console.log((e as Error).message)
        setError(<div className='items-left block text-start'>
          <Alert
            variation="error"
            isDismissible={false}
            hasIcon={true}
            heading="Error"
          >
            {(e as Error).message}
          </Alert>
        </div>)
      }

      setProgress(false)

    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className='text-2xl	font-bold'>GPT Researcher powerd by Amazon Nova</h1>
      <div className="p-4 border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message here..."
            className="w-full p-4 pr-24 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            disabled={!(input.length > 0 && !progress) || progress}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 focus:outline-none px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleSend}>
            Send Message
          </button>
        </div>
      </div>
      <div hidden={!progress} className="p-8">
        <div className='mb-1'><Placeholder size="large" /></div>
        <div className='mb-1'><Placeholder /></div>
        <div className='mb-1'><Placeholder size="small" /></div>
      </div>

      {error}

      <Markdown className='markdown items-left block text-start'>{output}</Markdown>

    </div>
  )
}

export default App
