import {UseChatHelpers} from 'ai/react';
import {Button} from './ui/button';
import {IconArrowRight} from './ui/icons';

const exampleMessages = [
  {
    heading: 'Explain 3D modelling',
    message: `Explain the utility of modelling data in a 3 dimensional cube?`,
  },
  {
    heading: 'Generate a report',
    message: 'Summarize the data headers for a 2nd grader: \n',
  },
  {
    heading: 'Give me a model idea',
    message: `Generate an executive summary regarding the data model: \n`,
  },
];

export function EmptyScreen({setInput}: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl p-2">
      <h1 className="mb-2 text-lg font-semibold">Welcome to Glyphx AI!</h1>
      <p className="leading-normal text-sm text-gray-300">
        You can start a conversation here or try the following examples:
      </p>
      <div className="mt-4 flex flex-col items-start space-y-2">
        {exampleMessages.map((message, index) => (
          <Button
            key={index}
            className="h-auto p-0 text-small hover:border-white rounded border border-gray text-center w-full"
            onClick={() => setInput(message.message)}
          >
            {message.heading}
          </Button>
        ))}
      </div>
    </div>
  );
}
