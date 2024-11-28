from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from PIL import Image, ImageDraw
from dotenv import load_dotenv
import os
import uuid
from azure.core.exceptions import HttpResponseError
from matplotlib import pyplot as plt

# Initialize Flask app
app = Flask(__name__)

# Set upload and output folders
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Load environment variables
load_dotenv()
AI_ENDPOINT = os.getenv('AI_SERVICE_ENDPOINT')
AI_KEY = os.getenv('AI_SERVICE_KEY')

# Initialize Azure AI Vision client
cv_client = ImageAnalysisClient(
    endpoint=AI_ENDPOINT,
    credential=AzureKeyCredential(AI_KEY)
)

# Serve processed images
@app.route('/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)


def getColor(tag):
    tag_colors = {
        "person": "red",
        "cat": "yellow",
        "dog": "yellow",
        "tree": "green",
        "water": "blue"
    }
    return tag_colors.get(tag, "black")


def detect_people(image_path):
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
        result = cv_client.analyze(
            image_data=image_data,
            visual_features=[
                VisualFeatures.PEOPLE,
                VisualFeatures.CAPTION,
                VisualFeatures.TAGS,
                ],
        )
        if not result:
            raise Exception("No results from Azure API")

        image = Image.open(image_path)
        draw = ImageDraw.Draw(image)

        for person in result.people.list:
            r = person.bounding_box
            bounding_box = ((r.x, r.y), (r.x + r.width, r.y + r.height))
            draw.rectangle(bounding_box, outline="red", width=3)

        output_file = f"people.jpg"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_file)
        image.save(output_path)
        return (output_path)
    except Exception as e:
        print(f"Error in detect_people: {e}")
        return None


def detect_objects(image_path):
    with open(image_path, "rb") as f:
                image_data = f.read()
    try:
        result = cv_client.analyze(
            image_data=image_data,
            visual_features=[
                VisualFeatures.CAPTION,
                VisualFeatures.TAGS,
                VisualFeatures.OBJECTS],
        )
        if result.caption is not None:
            print("\nCaption:")
            print(" Caption: '{}' (confidence: {:.2f}%)".format(result.caption.text, result.caption.confidence * 100))
        if result.tags is not None:
            print("\nTags:")
            for tag in result.tags.list:
                print(" Tag: '{}' (confidence: {:.2f}%)".format(tag.name, tag.confidence * 100))
        if result.objects is not None:
            print("\nObjects in image:")

            # Prepare image for drawing
            image = Image.open(image_path)
            fig = plt.figure(figsize=(image.width/100, image.height/100))
            plt.axis('off')
            draw = ImageDraw.Draw(image)
            color = 'cyan'

            for detected_object in result.objects.list:
                print(" {} (confidence: {:.2f}%)".format(detected_object.tags[0].name, detected_object.tags[0].confidence * 100))
                
                r = detected_object.bounding_box
                bounding_box = ((r.x, r.y), (r.x + r.width, r.y + r.height)) 
                draw.rectangle(bounding_box, outline=color, width=3)
                plt.annotate(detected_object.tags[0].name,(r.x, r.y), backgroundcolor=color)


            plt.imshow(image)
            plt.tight_layout(pad=0)
            outputfile = 'object.jpg'
            output_path = os.path.join(app.config['OUTPUT_FOLDER'], outputfile)
            fig.savefig(output_path)
           
            print('  Results saved in', outputfile)

            return outputfile
    except Exception as e:
        print(f"Error in detect_objects: {e}")
        return None


@app.route('/analyse_image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    analysis_type = request.form.get('type', 'detect-objects')

    if analysis_type not in ['detect-people', 'detect-objects']:
        return jsonify({"error": "Invalid analysis type"}), 400

    filename = secure_filename(image.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}_{filename}")
    image.save(image_path)

    if analysis_type == 'detect-people':
        output_path = detect_people(image_path)
    elif analysis_type == 'detect-objects':
        output_path = detect_objects(image_path)
    else:
        return jsonify({"error": "Invalid analysis type"}), 400

    if output_path:
        image_url = f"http://127.0.0.1:5000/{os.path.basename(output_path)}"
        return jsonify({"image_url": image_url}), 200
    else:
        return jsonify({"error": "Image processing failed"}), 500


if __name__ == '__main__':
    from flask_cors import CORS
    CORS(app)
    app.run(debug=True)
