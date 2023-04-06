const handler = (req, res) => {
  res.status(200).json({
    _id: '642ed599d2c489175363dd8b',
    email: 'jp@glyphx.co',
    emailVerified: new Date('2023-04-06T14:22:17.127Z'),
    updatedAt: new Date('2023-04-06T14:22:17.942Z'),
    userCode: '4d6c75b61a8d4af2833b7d50546d6fc9',
    customerPayment: '642ed599d2c489175363dd91',
  });
};

export default handler;
