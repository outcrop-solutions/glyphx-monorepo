/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export const SearchFilter = () => {
    return (
      <div>
        <div className="mt-1 border-b border-gray-300 focus-within:border-indigo-600">
          <input
            type="text"
            name="name"
            id="name"
            className="block w-full border-0 border-b border-transparent bg-transparent focus:border-indigo-600 focus:ring-0 sm:text-sm"
            placeholder="Search Keywords"
          />
        </div>
      </div>
    )
  }
  