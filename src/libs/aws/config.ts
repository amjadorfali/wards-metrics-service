import {
  AWS_ACCESS_KEY_ID,
  AWS_COGNITO_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config";

export const awsConfig = {
  region: AWS_COGNITO_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};

