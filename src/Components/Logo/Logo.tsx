import logo from "../../assets/Group 45.svg";

const Logo = () => {
  return (
    <div className="h-[93px] flex items-center">
      <img
        src={logo}
        alt="Logo image"
        className="max-h-full object-contain -mt-1"
      />
    </div>
  );
};

export default Logo;
