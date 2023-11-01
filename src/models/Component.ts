import { JsonObject } from '../utils/JsonObject';

interface Component {
  id: number;
  name: string;
  functionName: string;
  description: JsonObject;
  code: string;
  state: JsonObject;
  isTemplate: boolean;
  createdAt: Date;
}

export default Component;
