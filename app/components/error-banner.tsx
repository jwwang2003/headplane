import { AlertCircle } from "lucide-react";
import { isRouteErrorResponse } from "react-router";

import { T, useI18n } from "~/i18n/provider";
import { isApiError, isConnectionError } from "~/server/headscale/api/error-client";
import cn from "~/utils/cn";

import Card from "./card";
import Code from "./code";
import Link from "./link";

export function getErrorMessage(error: Error | unknown): {
  title: React.ReactNode;
  jsxMessage: React.ReactNode;
} {
  if (isRouteErrorResponse(error)) {
    if (isApiError(error.data)) {
      const { statusCode, rawData, data, requestUrl } = error.data;
      if (statusCode >= 500) {
        return {
          jsxMessage: (
            <>
              <Card.Text>
                <T text={"There was an error communicating with the Headscale API."} />
                <br />
                <T text={"The server responded with a status code of"} />{" "}
                <strong>{statusCode}</strong>
                <T
                  text={
                    ", indicating a server-side issue. Please check the Headscale server status and try again later."
                  }
                />
              </Card.Text>
              {(error.data.data != null || error.data.rawData != null) && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
                  {error.data.data != null ? (
                    <code>{JSON.stringify(error.data.data, null, 2)}</code>
                  ) : (
                    <code>{error.data.rawData}</code>
                  )}
                </pre>
              )}
            </>
          ),
          title: "Headscale API Error",
        };
      }

      const authError = error.data.statusCode === 401 || error.data.statusCode === 403;

      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">
              <T text={"The Headscale API returned an unexpected response."} />
              {authError ? (
                <>
                  {" "}
                  <T
                    text={
                      "The status code indicates an authentication error. Please verify your API key and Headplane configuration."
                    }
                  />
                </>
              ) : (
                <>
                  {" "}
                  <T
                    text={
                      "You may be using an unsupported version of Headscale or this may be a bug."
                    }
                  />
                </>
              )}
            </Card.Text>
            <ul className="mt-2 list-inside list-disc">
              <li>
                <T text={"Request URL:"} /> <Code>{requestUrl}</Code>
              </li>
              <li>
                <T text={"Status Code:"} />{" "}
                <Code>
                  {/* @ts-expect-error */}
                  {data === null ? (
                    <>
                      {statusCode} {rawData}
                    </>
                  ) : (
                    <>
                      {statusCode} {error.statusText}
                    </>
                  )}
                </Code>
              </li>
            </ul>
            <Card.Text className="mt-4 text-lg font-semibold">
              <T text={"Error Details"} />
            </Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              <code>{JSON.stringify(error.data, null, 2)}</code>
            </pre>
          </>
        ),
        title: "Invalid response from Headscale API",
      };
    }

    if (isConnectionError(error.data)) {
      const { requestUrl, errorCode, errorMessage, extraData } = error.data;
      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">
              <T
                text={
                  "Headplane was unable to reach the Headscale API. Please check your network setup and configuration to ensure Headplane is able to connect."
                }
              />
            </Card.Text>
            <Card.Text className="mt-4 text-lg font-semibold">
              <T text={"Error Details"} />
            </Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              {requestUrl}
              <br />
              {errorCode}: {errorMessage}
              {extraData != null && (
                <>
                  <br />
                  <br />
                  <code>{JSON.stringify(extraData, null, 2)}</code>
                </>
              )}
            </pre>
          </>
        ),
        title: "Cannot connect to Headscale API",
      };
    }

    return {
      jsxMessage: (
        <>
          <T text={"There was an error processing your request."} />
          <br />
          <T text={"Status Code:"} /> <strong>{error.status}</strong>
          <br />
          <T text={"Status Text:"} />{" "}
          <strong>{typeof error.data === "string" ? <T text={error.data} /> : error.data}</strong>
        </>
      ),
      title: <T text="Error {status}" values={{ status: error.status }} />,
    };
  }

  if (!(error instanceof Error)) {
    return {
      jsxMessage: (
        <>
          <Card.Text>
            <T
              text={
                "An unexpected error occurred which is most likely a bug. Please consider reporting filing an issue on the"
              }
            />{" "}
            <Link external styled to="https://github.com/tale/headplane/issues">
              <T text={"Headplane GitHub"} />
            </Link>{" "}
            <T text={"repository with the details below."} />
          </Card.Text>
          <Card.Text className="mt-4 text-lg font-semibold">
            <T text={"Error Details"} />
          </Card.Text>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
            <code>{JSON.stringify(error, null, 2)}</code>
          </pre>
        </>
      ),
      title: "Unexpected Error",
    };
  }

  // Traverse the error chain to find the root cause
  let rootError = error;
  if (error.cause != null) {
    rootError = error.cause as Error;
    while (rootError.cause != null) {
      rootError = rootError.cause as Error;
    }
  }

  // TODO: If we are aggregate, concat into a single message
  if (rootError instanceof AggregateError) {
    throw new Error("AggregateError handling not implemented yet");
  }

  return {
    jsxMessage: rootError.message,
    title:
      rootError.name.length > 0 && rootError.name !== "Error" ? (
        <T text="Error: {name}" values={{ name: rootError.name }} />
      ) : (
        "Error"
      ),
  };
}

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  const { t } = useI18n();
  const { title, jsxMessage } = getErrorMessage(error);

  return (
    <Card className={cn("w-screen", className)} variant="flat">
      <div className="flex items-center justify-between gap-4">
        <Card.Title>{typeof title === "string" ? t(title) : title}</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      {typeof jsxMessage === "string" ? t(jsxMessage) : jsxMessage}
    </Card>
  );
}
