function Heading({as = "h1", children, className = "", ...props}) {
  const Component = as;
  const baseClasses = {
    h1: "text-3xl font-bold text-gray-700 mb-2",
    h2: "text-2xl font-bold text-gray-700 mb-2",
    h3: "text-xl font-bold text-gray-700 mb-2",
    h4: "text-lg font-bold text-gray-700 mb-2",
  };

  return (
    <Component className={`${baseClasses[as]} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export default Heading;
