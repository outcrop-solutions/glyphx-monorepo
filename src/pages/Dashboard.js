import NavBar from "../partials/NavBar";
const user = {
  name: "Bryan Holster",
  email: "bryan@synglyphx.com",
  imageUrl: "/bryan.jpg",
};

const people = [
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
];

export const Dashboard = () => {
  return (
    <div className="h-screen bg-primary-dark-blue">
      <div className="h-screen">
        <div className="min-h-full">
          <NavBar user={user} />

          <div className="py-10">
            <header className="mb-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold leading-tight text-white">
                  Dashboard
                </h1>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-800 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                City
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Last Invoice
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Total Models
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Receivables
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Edit</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-200">
                            {people.map((person) => (
                              <tr key={person.email}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                                  {person.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.invoice}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.models}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.received}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-indigo-600 hover:text-indigo-900">
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
