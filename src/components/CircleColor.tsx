interface IProps {
  color: string;
}

const CircleColor = ({ color }: IProps) => {
  return <span className={`block w-5 h-5 rounded-full cursor-pointer mb-1`} style={{ backgroundColor: color }} />;
};

export default CircleColor;
