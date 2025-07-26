import logo_light from "../../assets/logo_light.png";
import logo_dark from "../../assets/logo_dark.png";


const Logo = () => {


  return (
    <div className="h-[93px] flex items-center p-2">
      <img
        src={localStorage.getItem("theme") == "light" ? logo_dark : logo_light}
        alt="Logo image"
        className="max-h-full object-contain -mt-1"
      />
    </div>
  );
};

export default Logo;
