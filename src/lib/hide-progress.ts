import { router } from '@inertiajs/react';
import NProgress from 'nprogress';

const hideProgress = () => {
    router.on('start', () => NProgress.start());
    router.on('finish', () => NProgress.done());
};

export default hideProgress;
