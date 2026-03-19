<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">

<head>
   <meta charset="utf-8">
   <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
   >
   <meta
      name="csrf-token"
      content="<?php echo e(csrf_token()); ?>"
   >

   
   <style>
      html {
         background-color: oklch(1 0 0);
      }

      html.dark {
         background-color: oklch(0.145 0 0);
      }
   </style>

   <?php if(app('system_settings')): ?>
      <title inertia>
         <?php echo e($metaTitle ?? app('system_settings')->fields['name']); ?>

      </title>
      <meta
         name="description"
         content="<?php echo e($metaDescription ?? app('system_settings')->fields['description']); ?>"
      >
      <meta
         name="keywords"
         content="<?php echo e($metaKeywords ?? app('system_settings')->fields['keywords']); ?>"
      >
      <meta
         name="author"
         content="<?php echo e(app('system_settings')->fields['author']); ?>"
      >

      <?php if(!empty(app('system_settings')->fields['favicon'])): ?>
         <link
            rel="icon"
            href="<?php echo e(app('system_settings')->fields['favicon']); ?>"
            type="image/png"
         >
      <?php elseif(!empty(app('system_settings')->fields['logo_light'])): ?>
         <link
            rel="icon"
            href="<?php echo e(app('system_settings')->fields['logo_light']); ?>"
            type="image/png"
         >
      <?php endif; ?>

      <meta
         property="og:type"
         content="<?php echo e($ogType ?? 'website'); ?>"
      >
      <meta
         property="og:url"
         content="<?php echo e($ogUrl ?? env('APP_URL', config('app.url'))); ?>"
      >
      <meta
         property="og:title"
         content="<?php echo e($ogTitle ?? (app('system_settings')->fields['title'] ?? app('system_settings')->fields['name'])); ?>"
      >
      <meta
         property="og:description"
         content="<?php echo e($ogDescription ?? app('system_settings')->fields['description']); ?>"
      >
      <meta
         property="og:site_name"
         content="<?php echo e(app('system_settings')->fields['name']); ?>"
      >

      <?php if(!empty($ogImage)): ?>
         <meta
            property="og:image"
            content="<?php echo e($ogImage); ?>"
         >
         <meta
            property="og:image:width"
            content="1200"
         >
         <meta
            property="og:image:height"
            content="630"
         >
         <meta
            property="og:image:alt"
            content="<?php echo e($ogTitle ?? app('system_settings')->fields['name']); ?>"
         >
      <?php elseif(!empty(app('system_settings')->fields['banner'])): ?>
         <meta
            property="og:image"
            content="<?php echo e(app('system_settings')->fields['banner']); ?>"
         >
         <meta
            property="og:image:width"
            content="1000"
         >
         <meta
            property="og:image:height"
            content="600"
         >
         <meta
            property="og:image:alt"
            content="<?php echo e(app('system_settings')->fields['name']); ?>"
         >
      <?php endif; ?>

      <meta
         name="twitter:card"
         content="<?php echo e($twitterCard ?? 'summary_large_image'); ?>"
      >
      <meta
         name="twitter:title"
         content="<?php echo e($twitterTitle ?? (app('system_settings')->fields['title'] ?? app('system_settings')->fields['name'])); ?>"
      >
      <meta
         name="twitter:description"
         content="<?php echo e($twitterDescription ?? app('system_settings')->fields['description']); ?>"
      >
      <?php if(!empty($twitterImage)): ?>
         <meta
            name="twitter:image"
            content="<?php echo e($twitterImage); ?>"
         >
      <?php elseif(!empty(app('system_settings')->fields['banner'])): ?>
         <meta
            name="twitter:image"
            content="<?php echo e(app('system_settings')->fields['banner']); ?>"
         >
      <?php endif; ?>
   <?php endif; ?>

   <link
      rel="preconnect"
      href="https://fonts.bunny.net"
   >
   <link
      href="https://fonts.bunny.net/css?family=inter:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i"
      rel="stylesheet"
   />

   <?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>
   <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
   <?php echo app('Illuminate\Foundation\Vite')(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"]); ?>
   <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
</head>

<body class="font-sans antialiased">
   <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>

   
   <?php ($globalStyle = app('system_settings')->fields['global_style'] ?? ''); ?>
   <?php if($globalStyle): ?>
      <style
         data-global-style
         type="text/css"
      >
         <?php echo $globalStyle; ?>

      </style>
   <?php endif; ?>
</body>

</html>
<?php /**PATH /home/nokxoidk/edvo.in/resources/views/app.blade.php ENDPATH**/ ?>