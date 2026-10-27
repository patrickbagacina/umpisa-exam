export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert alert--error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="button button--small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
