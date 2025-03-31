export function Switch({ checked, onCheckedChange }) {
    return (
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="hidden"
        />
        <span
          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition ${
            checked ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          ></span>
        </span>
      </label>
    );
  }
  