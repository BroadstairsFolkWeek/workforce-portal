const Footer: React.FC = () => {
  return (
    <div className="px-2 h-8 bg-black text-white text-left">
      <span className="inline-block mr-2 h-full align-middle">
        <a
          href="https://watfordconsulting.com"
          target="_blank"
          rel="noreferrer"
        >
          Built by
        </a>
      </span>
      <span className="inline-block h-full">
        <a
          href="https://watfordconsulting.com"
          target="_blank"
          rel="noreferrer"
        >
          <span className="inline-block h-8 w-20 bg-red bg-watford-consulting-logo-white bg-contain bg-no-repeat bg-left"></span>
        </a>
      </span>
    </div>
  );
};

export default Footer;
