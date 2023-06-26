import {
    commit,
    commitAt,
    commitAuthor,
    secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion,
} from "../../../package.readonly";
import { homepage, packageIdentifier } from "../../../package";
import {useIsTrusted} from "../data";

export const path = "/settings";

export function Settings() {
    const isTrusted = useIsTrusted()
    return (
        <>
            <p>You are running {packageIdentifier}</p>
            <p>
                <a
                    href="/api/documentation"
                    target="_blank"
                    className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
                >
                    Checkout the API documentation!
                </a>
            </p>
            <p>
                <a
                    href={homepage}
                    target="_blank"
                    className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
                >
                    Checkout the source code!
                </a>
            </p>
            <br />
            <br />
            {
                isTrusted ? (
                    <>
                        <a
                            href="/invite/create"
                            className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
                        >
                            Create Role Invite
                        </a>
                        <br />
                    </>
                ) : undefined
            }
            <a
                href="/user-credentials"
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
                Credentials
            </a>
            <br />
            <a
                href="/payment-methods"
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
                Payment Methods
            </a>
            <br />
            <br />
            <hr />
            <br />
            <p data-seconds="${secondsBetweenCommitAndBuild}">
                <strong>Time between commit and build</strong>
                <br />
                {timeBetweenCommitAndBuild}
            </p>
            {timeBetweenCommitAndTestCompletion ? (
                <p data-seconds={secondsBetweenCommitAndTestCompletion}>
                    <strong>Time between commit and tests completion</strong>
                    <br />
                    {timeBetweenCommitAndTestCompletion}
                </p>
            ) : (
                ""
            )}
            <p>
                Source code last updated at {commitAt} by {commitAuthor}
                <br />
                Commit Hash: {commit}
            </p>
        </>
    );
}

export const Component = Settings;