import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36 animate-in fade-in duration-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-in slide-in-from-bottom-4 duration-700"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to Our Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect, collaborate, and create amazing experiences with our innovative platform.
            </p>
            {!isAuthenticated && (
              <div className="mt-10 flex items-center justify-center gap-x-6 animate-in slide-in-from-bottom-2 duration-500">
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 animate-in fade-in duration-700 delay-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 animate-in slide-in-from-bottom-2 duration-500">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl animate-in slide-in-from-bottom-2 duration-500 delay-100">
              Features that empower you
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className={`flex flex-col animate-in slide-in-from-bottom-2 duration-500 delay-${index * 100}`}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    {feature.icon}
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8 animate-in fade-in duration-700">
        <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden [mask-image:radial-gradient(50%_45%_at_50%_55%,white,transparent)]">
          <div className="h-[40rem] w-[80rem] flex-none bg-gradient-to-r from-indigo-100 to-blue-100 opacity-20" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl animate-in slide-in-from-bottom-2 duration-500">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 animate-in slide-in-from-bottom-2 duration-500 delay-100">
            Join thousands of users who are already experiencing the power of our platform.
          </p>
          {!isAuthenticated && (
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-in slide-in-from-bottom-2 duration-500 delay-200">
              <Link
                to="/signup"
                className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started now
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    name: 'Real-time Collaboration',
    description: 'Work together seamlessly with team members in real-time, making collaboration effortless and efficient.',
    icon: '🤝',
  },
  {
    name: 'Advanced Security',
    description: 'Your data is protected with enterprise-grade security measures, ensuring peace of mind.',
    icon: '🔒',
  },
  {
    name: 'Intuitive Interface',
    description: 'A user-friendly interface that makes navigation and usage a breeze for everyone.',
    icon: '✨',
  },
]

export default Home