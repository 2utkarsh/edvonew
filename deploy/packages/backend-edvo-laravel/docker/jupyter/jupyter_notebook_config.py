# Jupyter Notebook Configuration for Mentor LMS

# Notebook settings
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.port = 8888
c.NotebookApp.open_browser = False
c.NotebookApp.allow_root = True

# Security
c.NotebookApp.token = ''
c.NotebookApp.password = 'sha1:mentor-lms-jupyter'

# Directory settings
c.NotebookApp.notebook_dir = '/home/jovyan/work'
c.ContentsManager.root_dir = '/home/jovyan/work'

# Kernel management
c.MultiKernelManager.default_kernel_name = 'python3'

# Enable JupyterLab
c.NotebookApp.default_url = '/lab'

# Allow remote access
c.NotebookApp.allow_remote_access = True

# Disable login requirement (for development)
c.NotebookApp.token = ''

# File management
c.FileContentsManager.delete_to_trash = False

# Auto-save settings
c.NotebookApp.autosave_interval = 30

# Extensions
c.NotebookApp.nbserver_extensions = {
    'jupyterlab': True,
    'notebook': True,
    'nbextensions_configurator': True,
}

# Python environment
c.InteractiveShellApp.matplotlib = 'inline'

# Memory limits (optional)
c.NotebookApp.max_buffer_size = 2**28  # 256MB

# Logging
c.Application.log_level = 'INFO'

# Allow custom CSS/JS
c.NotebookApp.extra_static_paths = ['/home/jovyan/.jupyter/custom']
c.NotebookApp.extra_template_paths = ['/home/jovyan/.jupyter/templates']

# Kernel specs
c.KernelSpecManager.whitelist = [
    'python3',
    'ir',
    'javascript',
]

# Enable collaborative features (optional)
c.NotebookApp.allow_origin = '*'
c.NotebookApp.websocket_compression_options = {}
c.NotebookApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' *"
    }
}
