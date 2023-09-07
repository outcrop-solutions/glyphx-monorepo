export const withSession = (handler, mockSession: Session) => {
  return (req, res) => handler(req, res, mockSession);
};
