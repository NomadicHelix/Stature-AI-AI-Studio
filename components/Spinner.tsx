const Spinner = ({
  size = "8",
  className = "border-brand-primary border-t-transparent",
}: {
  size?: string;
  className?: string;
}) => {
  return (
    <div
      className={`w-${size} h-${size} border-4 border-solid rounded-full animate-spin ${className}`}
    ></div>
  );
};

export default Spinner;
