import { useNavigate } from "react-router-dom";

export const Logo = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <h1 
      className="[font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#acbd86] text-8xl text-center mb-16 cursor-pointer hover:text-[#acbd86]/80 transition-colors"
      onClick={() => navigate('/')}
    >
      MewFlo
    </h1>
  );
}; 