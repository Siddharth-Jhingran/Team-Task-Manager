import './Loader.css';

const Loader = ({ fullScreen = false, small = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className={`loader-spinner ${small ? 'small' : ''}`}></div>
    </div>
  );
};

export default Loader;
