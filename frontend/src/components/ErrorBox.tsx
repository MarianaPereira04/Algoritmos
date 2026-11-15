type ErrorBoxProps = { message: string };

export function ErrorBox({ message }: ErrorBoxProps) {
  return (
    <div className="error-box" role="alert">
      {message}
    </div>
  );
}
