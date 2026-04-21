import * as React from "react";

// Default export + React.FC<Props> annotation + ReactNode children
export interface CardProps {
  title: string;
  children: React.ReactNode;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({ title, children, bordered = true }) => {
  return (
    <section data-bordered={bordered}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
};

export default Card;
