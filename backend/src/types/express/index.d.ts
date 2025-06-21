import { IUserDocument } from '../../models/User';

declare global {
  namespace Express {
    export interface Request {
      user?: IUserDocument;
    }
  }
}

// This export makes the file a module and allows augmenting the global namespace.
export {}; 