const Button = ({ text, onClick, variant = "primary", type = "button" }) => {
    return (
      <button
        type={type}
        className={`btn btn-${variant}`}
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default Button;
  