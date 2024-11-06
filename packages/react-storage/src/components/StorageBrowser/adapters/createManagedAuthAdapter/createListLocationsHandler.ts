import { ListLocations } from '../../storage-internal';
import {
  listCallerAccessGrants,
  CredentialsProvider,
} from '../../storage-internal';

interface CreateListLocationsHandlerInput {
  accountId: string;
  credentialsProvider: CredentialsProvider;
  region: string;
}

export const createListLocationsHandler = (
  handlerInput: CreateListLocationsHandlerInput
): ListLocations => {
  return async function listLocations(input = {}) {
    const result = await listCallerAccessGrants({ ...input, ...handlerInput });

    return result;
  };
};