document.getElementById('image-upload').addEventListener('change', function(event) {
    const [file] = this.files;
    if (file) {
      document.getElementById('profile-preview').src = URL.createObjectURL(file);
    }
  });