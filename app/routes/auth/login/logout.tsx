import Card from "~/components/card";
import { T } from "~/i18n/provider";

export default function Logout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="m-4 max-w-md sm:m-0">
        <Card.Title>
          <T text={"You have been logged out"} />
        </Card.Title>
        <Card.Text>
          <T
            text={
              "You can now close this window. If you would like to log in again, please refresh the page."
            }
          />
        </Card.Text>
      </Card>
    </div>
  );
}
