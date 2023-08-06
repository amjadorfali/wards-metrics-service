import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { AWS_COGNITO_CLIENT_ID, AWS_COGNITO_USER_POOL_ID } from "../../config";
import { awsConfig } from "./config";

export const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: AWS_COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: AWS_COGNITO_CLIENT_ID,
});

const client = new CognitoIdentityProviderClient(awsConfig);

export const getCognitoUser = async (
  sub: string
): Promise<{ email: string | undefined }> => {
  const command = new AdminGetUserCommand({
    UserPoolId: AWS_COGNITO_USER_POOL_ID,
    Username: sub,
  });
  const response = await client.send(command);

  const email = response.UserAttributes?.find(
    (item) => item.Name === "email"
  )?.Value;
  return { email };
};
