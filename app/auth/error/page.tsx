export default function AuthErrorPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-sm font-medium text-gray-900">
            Something went wrong
          </h2>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Please try again or contact support if the problem persists.
        </div>
        <div className="mt-6 flex items-center justify-center">
          <a href="/" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}