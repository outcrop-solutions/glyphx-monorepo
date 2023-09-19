// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { customerPaymentService} from 'business';
import {error} from 'core';

/**
 * Create CustomerPayment
 *
 * @note Creates a customerPayment
 * @route POST /api/customerPayment
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createCustomerPayment = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const customerPayment = await customerPaymentService.createCustomerPayment(req.body);
    res.status(200).json({data: customerPayment });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get CustomerPayments
 *
 * @note returns customerPayments
 * @route GET /api/customerPayments
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getCustomerPayments = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const customerPayments = await customerPaymentService.getCustomerPayments({deletedAt: undefined});
    res.status(200).json({data: { customerPayments }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get CustomerPayment
 *
 * @note returns a customerPayment by id
 * @route GET /api/customerPayment/[customerPaymentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getCustomerPayment = async (req: NextApiRequest, res: NextApiResponse) => {
  const { customerPaymentId} = req.query;
  if (Array.isArray(customerPaymentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const customerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId as string);
    res.status(200).json({data: { customerPayment }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update CustomerPayment
 *
 * @note returns a customerPayment by id
 * @route PUT /api/customerPayment/[customerPaymentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateCustomerPayment = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { customerPaymentId} = req.query;
  const { customerPayment } = req.body;
  if (Array.isArray(customerPaymentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedCustomerPayment = await customerPaymentService.updateCustomerPayment(customerPaymentId as string, customerPayment);

    res.status(200).json({data: { customerPayment: updatedCustomerPayment }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete CustomerPayment
 *
 * @note  update customerPayment deletedAt date
 * @route DELETE /api/customerPayment
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteCustomerPayment = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { customerPaymentId} = req.query;
  if (Array.isArray(customerPaymentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await customerPaymentService.deleteModelCustomerPayment(customerPaymentId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
