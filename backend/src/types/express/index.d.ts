import { IUserDocument } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

// Ensure this file is treated as a module
export {}; 