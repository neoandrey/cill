from flask import (
    render_template,
    redirect,
    url_for,
    flash,
    request,
    session,
    jsonify,
    current_app,
    abort,
)
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename
from flask_login import login_user, logout_user, current_user, login_required
from flask_babel import _
from app import db, login, get_debug_template, settings, csrf, cache, log, os

from app.models import (
    AuditTrail,
    Users,
    SiteSettings,
    Images,
    Roles,
    Templates,
    Pages,
    Sections,
    TeamMembers,
    IMAPAccounts,
    GMailAccounts,
    Clients,
    Banners,
    Files,
    Partners,
    ServiceTypes,
    Services,
    Faqs,
    Ratings,
)
from app.main import bp
from jinja2 import (
    Template,
    Environment,
    BaseLoader,
    FileSystemLoader,
    select_autoescape,
)
import html, stat

# from app.main.forms import (
#     LoginForm,
#     RegistrationForm,
#     ResetPasswordRequestForm,
#     ResetPasswordForm,
#     UserRegistrationForm,
# )

# from app.cpanel.email import send_password_reset_email
from datetime import datetime, timedelta, timezone
import time, os, traceback, json, rq, uuid
import app.models as models
from flask_mongoengine import BaseQuerySet

# from app.translate import translate
from app.main import bp  # Do not import the wrong routes

from app.main.serializer import Serializer
from rq.job import Job
from PIL import Image, ImageFilter

# from uuid import uuid4
import traceback, inspect


@bp.before_request
def make_session_permanent():
    """
    Define the lifetime of session. This function might be redundant
    """
    session.permanent = True
    bp.permanent_session_lifetime = timedelta(
        minutes=current_app.config["SESSION_DURATION_MINS"]
    )


def format_data(data):
    """
    Format data from mongo queries
    """
    if str(type(data)) == "datetime.datetime":
        return data.strftime("%Y%m%d_%H%M%S")
    elif str(type(data)) == "bson.objectid.ObjectId":
        return str(data)
    elif type(data) is dict:
        return json.dumps(data)
    elif type(data) is int:
        return int(data)
    elif type(data) is list:
        return data
    else:
        return str(data)


def convert_row_data(row):
    """
    Convert a single row into a object -  seems redundant
    """
    new_row = {}
    for k, v in row.items():
        new_row[k] = format_data(v)
    return new_row


def get_row_data(data):
    """
    Get single row data from query cursor
    """
    data = data.to_json()
    temp_data = {}
    for k, v in json.loads(data).items():
        temp_data[k] = format_data(v)
    return temp_data


def get_found_records(data):
    """
    Return all records from a query cursor. Format passwords and dates.
    """
    results = []
    data = data.to_json()
    if len(data) > 0:
        for row in json.loads(data):
            temp_data = {}
            for k, v in row.items():
                if "password" in k:
                    temp_data[k] = "*" * 12
                elif "date" in k or "time" in k:
                    temp_data[k] = (
                        (datetime.fromtimestamp(v["$date"] / 1000.0)).strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                        if "$date" in v
                        else v
                    )
                elif k != "_id":
                    temp_data[k] = v
            results.append(temp_data)
    return results


def get_collection_data(data):
    """
    Return all records from a query cursor.
    """
    table_data = []
    for row in data:
        temp_data = {}
        for k, v in row.items():
            if k == "records":
                temp_data[k] = get_collection_data(v)
            else:
                temp_data[k] = format_data(v)
        table_data.append(temp_data)
    return table_data


def get_file_format(ext):
    """
    Get Mime type from extension.
    """
    file_format = None
    format_dict = {
        "aac": "audio/aac",
        "abw": "application/x-abiword",
        "apng": "image/apng",
        "arc": "application/x-freearc",
        "avif": "image/avif",
        "avi": "video/x-msvideo",
        "azw": "application/vnd.amazon.ebook",
        "bin": "application/octet-stream",
        "bmp": "image/bmp",
        "bz": "application/x-bzip",
        "bz2": "application/x-bzip2",
        "cda": "application/x-cdf",
        "csh": "application/x-csh",
        "css": "text/css",
        "csv": "text/csv",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "eot": "application/vnd.ms-fontobject",
        "epub": "application/epub+zip",
        "gz": "application/gzip",
        "gif": "image/gif",
        "htm, .html": "text/html",
        "ico": "image/vnd.microsoft.icon",
        "ics": "text/calendar",
        "jar": "application/java-archive",
        "jpeg, .jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "jsonld": "application/ld+json",
        "mid, .midi": "audio/midi, audio/x-midi",
        "mjs": "text/javascript",
        "mp3": "audio/mpeg",
        "mp4": "video/mp4",
        "mpeg": "video/mpeg",
        "mpkg": "application/vnd.apple.installer+xml",
        "odp": "application/vnd.oasis.opendocument.presentation",
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "odt": "application/vnd.oasis.opendocument.text",
        "oga": "audio/ogg",
        "ogv": "video/ogg",
        "ogx": "application/ogg",
        "opus": "audio/opus",
        "otf": "font/otf",
        "png": "image/png",
        "pdf": "application/pdf",
        "php": "application/x-httpd-php",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "rar": "application/vnd.rar",
        "rtf": "application/rtf",
        "sh": "application/x-sh",
        "svg": "image/svg+xml",
        "tar": "application/x-tar",
        "tif, .tiff": "image/tiff",
        "ts": "video/mp2t",
        "ttf": "font/ttf",
        "txt": "text/plain",
        "vsd": "application/vnd.visio",
        "wav": "audio/wav",
        "weba": "audio/webm",
        "webm": "video/webm",
        "webp": "image/webp",
        "woff": "font/woff",
        "woff2": "font/woff2",
        "xhtml": "application/xhtml+xml",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xml": "application/xml",
        "xul": "application/vnd.mozilla.xul+xml",
        "zip": "application/zip",
        "3gp": "video/3gpp; audio/3gpp",
        "3g2": "video/3gpp2; audio/3gpp2",
        "7z": "application/x-7z-compressed",
    }
    file_format = (
        format_dict[ext.lower()] if ext.lower() in format_dict.keys() else file_format
    )
    return file_format


def get_collection_from_name(name):
    """
    Return collection object from name
    """
    lower_case = name.lower()
    table_key = name
    for k in models.__dict__.keys():
        if k.lower() == lower_case + "s":
            table_key = k
            break
    collection = models.__dict__[table_key]
    return collection


@login.user_loader
def user_loader(id):
    return session["current_user"]


def resize_image(image_path, dimensions):
    """
    Resize image to the dimensions specified
    """
    with Image.open(image_path) as img:
        width = int(str(dimensions["width"]).replace("px", ""))
        height = int(str(dimensions["height"]).replace("px", ""))
        new_image = img.resize((width, height))
        try:
            new_image = new_image.filter(ImageFilter.SHARPEN)
            new_image = new_image.filter(ImageFilter.EDGE_ENHANCE)
            new_image = new_image.filter(ImageFilter.SMOOTH)
            new_image.save(image_path, quality=100, optimize=True)
        except:
            print("Image optimization failed")
        return new_image.size


@bp.route("/main/original", methods=["GET", "POST"])
@bp.route("/original", methods=["GET", "POST"])
def original():
    """
    This function handles the /index  route
    """
    opts = {}
    opts["logo"] = "/static/logo_mini.png"
    opts["startTime"] = datetime.now()
    opts["timeOut"] = None
    opts["siteName"] = settings["SITE_ID"]
    opts["siteDescription"] = settings["SITE_DESCRIPTION"]
    opts["siteKeywords"] = settings["SITE_KEYWORDS"]
    opts["sitetTitle"] = settings["SITE_TITLE"]
    opts["userName"] = None
    opts["previousDest"] = None

    version = str(round(time.time() * 1000))

    return render_template(
        "index_default.html",
        title="index",
        pageID="index",
        options=opts,
        version=version,
    )


@bp.route("/", methods=["GET", "POST"])
@bp.route("/main/index", methods=["GET", "POST"])
@bp.route("/index", methods=["GET", "POST"])
@bp.route("/pages/home", methods=["GET", "POST"])
@bp.route("/home", methods=["GET", "POST"])
def index():
    """
    This function handles the /index  route
    """
    opts = {}
    opts["logo"] = "/static/logo_mini.png"
    opts["startTime"] = datetime.now()
    opts["timeOut"] = None
    opts["siteName"] = settings["SITE_ID"]
    opts["siteDescription"] = settings["SITE_DESCRIPTION"]
    opts["siteKeywords"] = settings["SITE_KEYWORDS"]
    opts["sitetTitle"] = settings["SITE_TITLE"]
    opts["userName"] = None
    opts["previousDest"] = None
    opts["siteSettings"] = {}
    siteSettings = SiteSettings.get({"settings_id": 1})
    if siteSettings:
        opts["siteSettings"] = siteSettings
    else:
        opts["siteSettings"]["site_name"] = current_app.config["APP_CONFIG"][
            "SITE_NAME"
        ]
        opts["siteSettings"]["site_title"] = current_app.config["APP_CONFIG"][
            "SITE_TITLE"
        ]
        opts["siteSettings"]["site_description"] = current_app.config["APP_CONFIG"][
            "SITE_DESCRIPTION"
        ]

    opts["clients"] = Clients.objects()
    opts["banner"] = Banners.objects()[0]
    opts["logo"] = siteSettings.site_logo
    opts["startTime"] = datetime.now()
    opts["siteTitle"] = siteSettings.site_title
    opts["timeOut"] = siteSettings.time_out_minutes
    opts["siteName"] = siteSettings.site_name
    opts["userName"] = ""
    opts["previousDestination"] = ""
    opts["currentTime"] = datetime.now()
    opts["isConfirmed"] = False
    opts["faqs"] = Faqs.objects()
    opts["services"] = []
    opts["serviceTypes"] = ServiceTypes.objects()

    opts["pricePlans"] = []
    opts["servicesSection"] = {}
    opts["servicesSection"]["header"] = "Services"
    opts["servicesSection"]["text"] = "All available services"
    opts["ratingsSection"] = {}
    opts["ratingsSection"]["text"] = "Ratings"
    opts["ratings"] = Ratings.objects()
    opts["teamMembers"] = TeamMembers.objects()
    partners = Partners.objects()
    if len(partners) > 0:
        opts["partners"] = partners

    version = str(round(time.time() * 1000))
    page_contents = {}
    opts["pages"] = []
    basedir = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
    templates_folder = basedir + os.path.sep + "templates"

    for page in Pages.objects():
        # try:
        # page.contents = page.contents.replace("&nbsp;", "")
        # page.contents = html.unescape(page.contents)
        rtemplate = None
        if "include" in page.contents:
            page_path = (
                page.contents.replace("{%", "")
                .replace("%}", "")
                .replace("include", "")
                .replace(" ", "")
                .replace('"', "")
            )
            rtemplate = Environment(
                loader=FileSystemLoader(searchpath=templates_folder)
            ).get_template(page_path)
        else:
            rtemplate = Environment(loader=BaseLoader()).from_string(page.contents)
        page_data = rtemplate.render(options=opts)
        page.contents = page_data  # html.escape(page_data)
        if page.is_nav_page:
            page.href = page.href.replace("/pages/", "#")
        page_contents[page.page_id] = page.contents
        opts["pages"].append(page)
        # except:
        #    traceback.format_exc()
    opts["navPages"] = [
        page for page in opts["pages"] if page.is_nav_page == True
    ]  # Pages.objects(__raw__={"is_nav_page": True})
    sub_pages = [
        page for page in opts["pages"] if page.is_child == True
    ]  # Pages.objects(__raw__={"is_child": True})
    opts["sub_pages"] = sub_pages
    opts["page_map"] = {}
    for page in sub_pages:
        parentPage = [
            par_page
            for par_page in opts["pages"]
            if page.parent_page and page.parent_page.page_id == par_page.page_id
        ]
        if parentPage:
            parent_page = parentPage[0]
            opts["page_map"][page.page_id] = parent_page
    for service in Services.objects():
        service.page.contents = page_contents[service.page.page_id]
        opts["services"].append(service)

    opts["sections"] = []
    for section in Sections.objects():
        for page in section.pages:
            page.contents = page_contents[page.page_id]
        opts["sections"].append(section)

    return render_template(
        "index.html",
        title="index",
        pageID="index",
        options=opts,
        version=version,
    )


def get_page(page_name):
    """
    This function handles the /pages  route
    """
    pages = [
        page for page in Pages.objects() if page.page_name.lower() == page_name.lower()
    ]
    current_page = pages[0] if pages else None

    if not current_page:
        abort(404)

    opts = {}

    opts["startTime"] = datetime.now()
    opts["timeOut"] = None
    opts["siteName"] = settings["SITE_ID"]
    opts["siteDescription"] = settings["SITE_DESCRIPTION"]
    opts["siteKeywords"] = settings["SITE_KEYWORDS"]
    opts["sitetTitle"] = settings["SITE_TITLE"]
    opts["userName"] = None
    opts["previousDest"] = None
    opts["siteSettings"] = {}
    siteSettings = SiteSettings.get({"settings_id": 1})
    if siteSettings:
        opts["siteSettings"] = siteSettings
    else:
        opts["siteSettings"]["site_name"] = current_app.config["APP_CONFIG"][
            "SITE_NAME"
        ]
        opts["siteSettings"]["site_title"] = current_app.config["APP_CONFIG"][
            "SITE_TITLE"
        ]
        opts["siteSettings"]["site_description"] = current_app.config["APP_CONFIG"][
            "SITE_DESCRIPTION"
        ]
    opts["logo"] = (
        "/static/logo_mini.png" if not siteSettings else siteSettings.site_logo
    )
    opts["icon"] = (
        "/static/images/favico.ico" if not siteSettings else siteSettings.site_icon
    )
    opts["clients"] = Clients.objects()
    opts["banner"] = Banners.get({"is_active": True})
    opts["logo"] = siteSettings.site_logo
    opts["startTime"] = datetime.now()
    opts["siteTitle"] = siteSettings.site_title
    opts["timeOut"] = siteSettings.time_out_minutes
    opts["siteName"] = siteSettings.site_name
    opts["userName"] = ""
    opts["previousDestination"] = ""
    opts["currentTime"] = datetime.now()
    opts["isConfirmed"] = False
    opts["faqs"] = Faqs.objects()
    opts["services"] = []
    opts["serviceTypes"] = ServiceTypes.objects()

    opts["pricePlans"] = []
    opts["servicesSection"] = {}
    opts["servicesSection"]["header"] = "Services"
    opts["servicesSection"]["text"] = "All available services"
    opts["ratingsSection"] = {}
    opts["ratingsSection"]["text"] = "Ratings"
    opts["ratings"] = Ratings.objects()
    opts["teamMembers"] = TeamMembers.objects()
    partners = Partners.objects()
    if len(partners) > 0:
        opts["partners"] = partners

    version = str(round(time.time() * 1000))
    page_contents = {}
    opts["pages"] = []

    for page in Pages.objects():
        try:
            rtemplate = Environment(loader=BaseLoader()).from_string(page.contents)
            page_data = rtemplate.render(options=opts)
            page.contents = page_data  # html.escape(page_data)
            page_names = [p.capitalize() for p in page.page.split("_")]
            page.page_name = page_names.join(" ")
            print(page.page_name)
        except:
            traceback.format_exc()
        if page.is_nav_page:
            page.href = page.href.replace("/pages/", "/#")
        page_contents[page.page_id] = page.contents
        opts["pages"].append(page)
        # except:
        #    traceback.format_exc()
    opts["navPages"] = [
        page for page in opts["pages"] if page.is_nav_page == True
    ]  # Pages.objects(__raw__={"is_nav_page": True})
    sub_pages = [
        page for page in opts["pages"] if page.is_child == True
    ]  # Pages.objects(__raw__={"is_child": True})
    opts["sub_pages"] = sub_pages
    opts["page_map"] = {}
    for page in sub_pages:
        parentPage = [
            par_page
            for par_page in opts["pages"]
            if page.parent_page and page.parent_page.page_id == par_page.page_id
        ]
        if parentPage:
            parent_page = parentPage[0]
            opts["page_map"][page.page_id] = parent_page
    for service in Services.objects():
        service.page.contents = page_contents[service.page.page_id]
        opts["services"].append(service)

    opts["sections"] = []
    for section in Sections.objects():
        for page in section.pages:
            page.contents = page_contents[page.page_id]
        opts["sections"].append(section)
    opts["current_page"] = [
        page for page in opts["pages"] if page.page_name.lower() == page_name.lower()
    ]
    opts["current_page"] = opts["current_page"][0]
    return render_template(
        "pages/custom.html",
        title=page_name,
        pageID=page_name,
        options=opts,
        version=version,
    )


@bp.route(
    "/pages/<page>/<sub_page>/<sub_sub_page>/<sub_sub_sub_page>",
    methods=["GET", "POST"],
)
def get_sub3_page(page, sub_page, sub_sub_page, sub_sub_sub_page):
    return get_page(sub_sub_sub_page)


@bp.route("/pages/<page>/<sub_page>/<sub_sub_page>")
def get_sub2_page(page, sub_page, sub_sub_page):
    return get_page(sub_sub_page)


@bp.route(
    "/pages/<page>/<sub_page>",
    methods=["GET", "POST"],
)
def get_sub1_page(page, sub_page):
    return get_page(sub_page)


@bp.route(
    "/pages/<page>",
    methods=["GET", "POST"],
)
def get_sub0_page(page):
    return get_page(page)


@csrf.exempt
@bp.route("/forms/<form_type>", methods=["POST"])
# @login_required
def process_form_entries(form_type):
    """
    Processes data received from forms
    """
    check_key = request.form.get("fmky")
    error_message = None
    print("form_type", form_type)
    if form_type == "registration":

        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email_address = request.form.get("email_address")
        address = request.form.get("address")
        date_of_birth = request.form.get("date_of_birth")
        phone_number = request.form.get("phone_number")
        status = 0
        # profile_image = request.form.get("profile_image")
        password = request.form.get("password")

        image_updated = request.form.get("image_name")
        image_name = request.form.get("image_name")
        image_updated = request.form.get("image_updated")
        image_file = request.files.get("image_file") if image_updated else None
        file_name = image_file.filename.split(os.sep)[-1] if image_file else None
        image_format = file_name.split(".")[-1]
        image_size = request.form.get("size")
        image_type = request.form.get("image_type")
        file_type = request.form.get("type")
        image_last_modified = request.form.get("lastModified")
        image_webkit_relative_path = request.form.get("webkitRelativePath")
        image_dimensions = request.form.get("image_dimensions")
        client_image = None
        if image_updated:
            filename = secure_filename(image_file.filename)
            image_file_name = image_file.filename.split(os.sep)[-1]
            filename = filename.split(os.sep)[-1]
            if filename != "":
                print(filename)
                file_ext = os.path.splitext(filename)[1].replace(".", "")
                if file_ext not in current_app.config["IMAGE_FORMATS"]:
                    print("File extension is not valid: " + file_ext)
                    abort(400)
            image_path = os.path.join(
                current_app.config["IMAGE_UPLOAD_DIRECTORY"]
                + os.sep
                + image_type.upper()
            )
            try:
                if not os.path.exists(image_path):
                    os.makedirs(image_path)
                    os.chmod(image_path, stat.S_IWRITE)
            except Exception as _:
                traceback.print_exc()
            upload_directory = image_path  # .replace("\\","\\\\"))
            filepath = os.path.join(upload_directory, image_file_name)
            existing_image = Images.get({"file_path": filepath})
            folders = filepath.split(os.sep)
            index_of_static = folders.index("static")
            url_folders = folders[index_of_static:]
            image_url = "/" + "/".join(url_folders)
            image_check = True if existing_image else False
            client_image_url = image_url
            if not image_check:
                image_id = Images.get_next("image_id")
                image = Images(
                    image_id=image_id,
                    image_name=image_name,
                    file_name=image_file_name,
                    image_format=image_format,
                    file_path=filepath,
                    file_size=image_size,
                    image_type=image_type,
                    file_type=file_type,
                    image_last_modified=image_last_modified,
                    image_dimensions=image_dimensions,
                    image_url=image_url,
                    webkit_relative_path=image_webkit_relative_path,
                    google_file_id=str(image_id),
                    google_url=image_url,
                    created_datetime=datetime.now(),
                    last_modified_date=datetime.now(),
                    current_version=0,
                )

                image_file.save(image.file_path)
                image.save()
                client_image = image
                resize_image(image.file_path, json.loads(image_dimensions))
                user_id = 0
                user_name = "System"
                AuditTrail.log_to_trail(
                    {
                        "old_object": None,
                        "new_object": image,
                        "description": "New record added to Images",
                        "change_type": "INSERT",
                        "object_type": "Image",
                        "user_id": str(user_id),
                        "username": user_name,
                    }
                )
                queue = rq.Queue(
                    current_app.config["REDIS_QUEUE_NAME"], connection=current_app.redis
                )
                queue.enqueue(
                    "app.tasks.upload_file_to_gdrive",
                    args=[image.image_id, "image", image.image_name],
                    job_timeout=current_app.config["SYNC_INTERVAL"],
                )

        client = Clients.get({"email_address": email_address})
        is_existing_client = True if client else False
        if not is_existing_client:
            client_id = Clients.get_next("client_id")
            client = Clients(
                client_id=client_id,
                first_name=str(first_name).strip(),
                last_name=str(last_name).strip(),
                email_address=email_address.strip(),
                address=address,
                date_of_birth=date_of_birth,
                phone_number=phone_number,
                status=status,
                profile_image=client_image,
                password=password,
                last_modified_date=datetime.now(),
                created_datetime=datetime.now(),
                current_version=0,
            )
            client.save()
            user_id = 0
            user_name = "system"
            AuditTrail.log_to_trail(
                {
                    "old_object": None,
                    "new_object": client,
                    "description": f"{form_type} record created",
                    "change_type": "INSERT",
                    "object_type": "Client",
                    "user_id": str(user_id),
                    "username": user_name,
                }
            )

            return jsonify({"message": "Client created successfully"})
        return jsonify({"message": "Client already exists"})
    else:
        print("invalid resource requested")
        abort(400)
