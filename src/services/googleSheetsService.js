// Service to fetch data from Google Sheets via a Google Apps Script web app
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzs1eNLD-aS50ECsqK-SPsBDambnMciZaCCqyCWdIazmJVP2alveOfThN1arOwP9-tL/exec";

export const fetchSheetData = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?sheet=CATEGORY`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};

// Function to compress image before upload
const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      console.log("Original image dimensions:", img.width, "x", img.height);
      console.log("Original image size:", file.size, "bytes");

      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      console.log("Compressed dimensions:", width, "x", height);

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("Compressed blob size:", blob.size, "bytes");
            console.log(
              "Compression ratio:",
              (((file.size - blob.size) / file.size) * 100).toFixed(1) +
                "% reduction"
            );
            resolve(blob);
          } else {
            console.error("Compression failed - blob is null");
            reject(new Error("Compression failed"));
          }
        },
        file.type || "image/jpeg",
        quality
      );
    };

    img.onerror = (error) => {
      console.error("Image loading failed:", error);
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const addCategory = async (categoryData) => {
  try {
    console.group("[FRONTEND] Category Submission Debug");
    console.log("Category Data:", categoryData);

    const formData = new FormData();
    formData.append("operation", "createCategory");
    formData.append("category", categoryData.name);
    formData.append("desc", categoryData.description || "");
    if (categoryData.image) {
      console.log("Processing image...");
      let base64Data;
      let imageName = "category-image";
      let imageMime = "image/png";

      if (categoryData.image instanceof File) {
        imageName = categoryData.image.name || imageName;
        imageMime = categoryData.image.type || imageMime;

        // Compress the image first
        console.log("Compressing image...");
        const compressedBlob = await compressImage(categoryData.image);
        console.log("Original size:", categoryData.image.size, "bytes");
        console.log("Compressed size:", compressedBlob.size, "bytes");

        // Convert compressed blob to base64
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(compressedBlob);
        });
        console.log(
          "Converted compressed File to base64 (length:",
          base64Data.length,
          ")"
        );
      } else if (typeof categoryData.image === "string") {
        base64Data = categoryData.image;
        // Try to infer mime and name from data URL
        const mimeMatch = base64Data.match(/^data:(.*?);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          imageMime = mimeMatch[1];
          const ext = imageMime.split("/")[1] || "png";
          imageName = `${imageName}.${ext}`;
        } else if (!base64Data.startsWith("data:")) {
          // If it's a raw base64 string, ensure it looks like a data URL for GAS
          base64Data = `data:${imageMime};base64,${base64Data}`;
        }
        console.log(
          "Using existing base64 data (length:",
          base64Data.length,
          ")"
        );
      }

      if (base64Data) {
        // Send a single base64 field that the backend can parse
        formData.append("imageBase64", base64Data);
        formData.append("imageName", imageName);
        formData.append("imageMime", imageMime);
        console.log(
          "[FormData] Added imageBase64 (length):",
          base64Data.length
        );
        console.log("[FormData] imageName:", imageName);
        console.log("[FormData] imageMime:", imageMime);
      }
    }

    console.log("=== DEBUG: FormData contents START ===");
    for (let [key, value] of formData.entries()) {
      console.log(
        key,
        typeof value === "string" && value.length > 100
          ? `${value.substring(0, 50)}...`
          : value
      );
    }
    console.log("=== DEBUG: FormData contents END ===");

    console.time("[Network] addCategory POST");
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
    console.timeEnd("[Network] addCategory POST");

    console.log("Response Status:", response.status, response.statusText);

    let result;
    try {
      const responseText = await response.text();
      console.log("=== DEBUG: Raw Response START ===");
      console.log(responseText);
      console.log("=== DEBUG: Raw Response END ===");
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response at line 123:", parseError);
      throw new Error("Invalid server response format at line 123");
    }

    if (!response.ok) {
      console.error(
        "HTTP Error at line 128:",
        response.status,
        response.statusText
      );
      throw new Error(
        `HTTP Error at line 128: ${response.status} - ${response.statusText}`
      );
    }

    console.log("Server Response:", result);
    console.groupEnd();

    if (!result.success) {
      throw new Error(
        result.error || result.message || "Category creation failed"
      );
    }

    return result;
  } catch (error) {
    console.error("Category submission error:", error);
    console.groupEnd();
    throw error;
  }
};
