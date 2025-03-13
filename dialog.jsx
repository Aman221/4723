export function Dialog({ children }) {
    return <div className="dialog">{children}</div>;
  }
  
  export function DialogTrigger({ children, ...props }) {
    return <button {...props}>{children}</button>;
  }
  
  export function DialogContent({ children }) {
    return <div className="border p-4 rounded-md shadow bg-white">{children}</div>;
  }
  