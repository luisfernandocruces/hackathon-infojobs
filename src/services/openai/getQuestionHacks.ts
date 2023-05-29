import { getNumberOfTokens } from '@utils/getNumberOfTokens';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import {
  MAXIMUM_OPENAI_TOKENS,
  TEMPERATURE_DETERMINISTIC,
} from '../../constants';
import { ApiError } from '@services/errors/ApiError';
import { AxiosError } from 'axios';
import { ServiceEnum } from '@services/serivices.enum';
import { getSystemMessageForInfoHackQuestions } from '@utils/getSystemMessageForInfoHackQuestions';

const openaiToken = process.env.OPENAI_API_KEY_INFOHACKS ?? '';

const configuration = new Configuration({ apiKey: openaiToken });
const openai = new OpenAIApi(configuration);

export const getQuestionHacks = async (offerDescription: string) => {
  const systemMessage = getSystemMessageForInfoHackQuestions();

  const totalTokens = getNumberOfTokens(
    JSON.stringify(systemMessage) + offerDescription
  );

  if (totalTokens >= MAXIMUM_OPENAI_TOKENS) {
    throw new ApiError(
      ServiceEnum.OPENAI,
      `Maximum quantity of tokens reached: ${MAXIMUM_OPENAI_TOKENS}`,
      400
    );
  }

  let data: string | string[];
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: TEMPERATURE_DETERMINISTIC,
      messages: [
        ...systemMessage,
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: offerDescription,
        },
      ],
    });
    data = completion.data.choices[0].message?.content ?? '';
  } catch (error) {
    const axiosError = error as AxiosError;

    throw new ApiError(
      ServiceEnum.OPENAI,
      axiosError.response?.data?.error?.message ?? 'unknown',
      axiosError.response?.status ?? 500
    );
  }

  try {
    if (typeof data !== 'string' || !data) {
      throw new Error(`Impossible get list from data: ${data.toString()}`);
    }
    data = data.split(';').map((item) => item.trim());
  } catch (error) {
    throw new ApiError(ServiceEnum.OPENAI, (error as Error).message, 500);
  }

  return data;
};
