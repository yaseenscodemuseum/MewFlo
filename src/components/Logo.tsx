export const Logo = (): JSX.Element => {
  return (
    <a
      href="https://yaseensportfolio.vercel.app"
      className="absolute top-[18px] left-[29px] z-[1001]"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/logo.svg"
        alt="MewFlo"
        className="h-[75px] w-auto transition-all"
      />
    </a>
  );
};
