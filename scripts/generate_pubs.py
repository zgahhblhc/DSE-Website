with open('./template_code.html', 'r') as f:
    template_code = f.read()

before, after = template_code.split('*****')
out_code = before

year_list = ['2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012 and Before']

for i, year in enumerate(year_list):
    with open('../publist/' + year, 'r') as f_in:
        pubs = f_in.read().split('\n\n')

    code = ''
    code += '\t\t\t\t<div class="fullwidth-block">\n' if i % 2 == 0 else '\t\t\t\t<div class="fullwidth-block" data-bg-color="#edf2f4">\n'
    code += '\t\t\t\t\t<div class="container">\n'
    code += '\t\t\t\t\t\t<h2 class="section-title">Publications in ' + year + '</h2>\n'

    for j, pub in enumerate(pubs):
        lines = pub.split('\n')
        code += '\t\t\t\t\t\t<p>[' + str(j+1) + '] ' + lines[0] + ' <br>\n'
        indent_num = 4 if (j+1) // 10 == 0 else 5
        indent = '&nbsp' * indent_num

        for line in lines[1:]:
            if len(line.split('-->')) > 1:
                text, link = line.split('-->')
                if link == '':
                    code += '\t\t\t\t\t\t' + indent + ' <a href="#">' + text +'</a> <br>\n'
                else:
                    code += '\t\t\t\t\t\t' + indent + ' <a href="' + link + '">' + text +'</a> <br>\n'
            else:
                code += '\t\t\t\t\t\t' + indent + ' ' + line + ' </p>\n'
    
    
    code += '\t\t\t\t\t</div>\n'
    code += '\t\t\t\t</div>\n\n'

    out_code += code


out_code += after

with open('../publications.html', 'w') as f_out:
    f_out.write(out_code)