export enum Role {
  User,
  Assistant,
  System,
}

interface Message {
  id: number;
  role: Role;
  content: string;
}

export default Message;
