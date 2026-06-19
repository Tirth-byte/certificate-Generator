import os
import sys
import argparse
import json
from generator import CertificateGenerator, generate_sample_assets

def main():
    parser = argparse.ArgumentParser(
        description="Certificate Generator: Overlay text columns from Excel onto an image template."
    )
    parser.add_argument(
        "--init", 
        action="store_true", 
        help="Initialize the project directory with sample assets (template image, mock Excel data, and config.json)."
    )
    parser.add_argument(
        "--config", 
        default="config.json", 
        help="Path to config.json (contains field mapping, coordinates, fonts, and settings)."
    )
    parser.add_argument(
        "--template", 
        help="Path to the certificate template image (PNG/JPG). Overrides value in config.json."
    )
    parser.add_argument(
        "--excel", 
        help="Path to the Excel file containing recipient data. Overrides value in config.json."
    )
    parser.add_argument(
        "--output", 
        help="Directory to save the generated certificates in. Overrides value in config.json."
    )
    parser.add_argument(
        "--preview", 
        action="store_true", 
        help="Generate a certificate for only the first row of data to quickly test the layout."
    )
    
    args = parser.parse_args()
    
    # Initialize sample assets if requested
    if args.init:
        generate_sample_assets(".")
        print("\nInitialization complete! Run 'python main.py' to generate certificates for the sample data.")
        sys.exit(0)
        
    # Auto-initialize if no config/args are present to ensure it's runnable immediately
    config_exists = os.path.exists(args.config)
    if not config_exists and not args.template and not args.excel:
        print("No input arguments or configuration file found.")
        print("Automatically creating sample project with a template, mock Excel data, and config.json...")
        try:
            generate_sample_assets(".")
            print("\nSample assets generated! Proceeding with a test generation in preview mode...")
            args.preview = True
        except Exception as e:
            print(f"Warning: Failed to auto-initialize sample assets: {e}")
            print("Please provide a config file, template image, and Excel spreadsheet manually.")
            sys.exit(1)
            
    # Load configuration
    config = {}
    config_path = args.config
    if os.path.exists(config_path):
        print(f"Loading configuration file: {config_path}")
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
        except Exception as e:
            print(f"Error reading configuration file {config_path}: {e}")
            sys.exit(1)
            
    # Determine settings (CLI overrides config)
    template_path = args.template or config.get("template_path")
    excel_path = args.excel or config.get("excel_path")
    output_dir = args.output or config.get("output_dir", "output")
    
    # Validation
    if not template_path:
        print("Error: Certificate template image path not specified. Use --template or define 'template_path' in config.json.")
        sys.exit(1)
    if not excel_path:
        print("Error: Excel spreadsheet path not specified. Use --excel or define 'excel_path' in config.json.")
        sys.exit(1)
        
    # Execute generation
    try:
        generator = CertificateGenerator(config=config)
        generator.run(
            template_path=template_path,
            excel_path=excel_path,
            output_dir=output_dir,
            preview_only=args.preview
        )
    except Exception as e:
        print(f"\nAn error occurred during certificate generation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
