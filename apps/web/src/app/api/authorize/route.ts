import {Initializer, userService} from 'business';
import {NextResponse} from 'next/server';

const authorize = async (req: Request) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  try {
    const body = await req.json();
    const users = await userService.getUsers({email: body.email});
    const user = users ? users[0] : null;

    // format user to next-auth shape
    // TODO: remove this when db formatter goes into production
    const newUser = {...user, id: user?._id?.toString()};
    return NextResponse.json({...newUser});
  } catch (error) {
    return null;
  }
};

export {authorize as POST};
